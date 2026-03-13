import { RefObject, useState, useEffect, useRef } from "react";
import { Camera, Loader2, RefreshCw, Sparkles, BrainCircuit } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";
import { DetectionSummary } from "../inventory_management/DetectionSummary";
import { notificationService } from "../../services/notificationService";
import { llmService } from "../../services/llmService";

// 使用 global 宣告來告訴 TypeScript 我們的 ort 在 window 上
declare global {
    interface Window {
        ort: any;
    }
}

interface CameraViewProps {
    videoRef: RefObject<HTMLVideoElement | null>;
}

/**
 * 攝影機掃描視圖 (CameraView - ONNX 離線版)
 */
export function CameraView({ videoRef }: CameraViewProps) {
    const { addItem, tempDetections, clearTempDetections, settings } = useIngredients();
    const [isScanning, setIsScanning] = useState(false);
    const [isCloudScanning, setIsCloudScanning] = useState(false);
    const [currentBoxes, setCurrentBoxes] = useState<any[]>([]);
    const [modelLoaded, setModelLoaded] = useState(false);
    const sessionRef = useRef<any>(null);

    // 類別名稱對照表 (由您的新版 YOLO 權重決定)
    const CLASS_NAMES = [
        "apple", "banana", "cabbage", "meat", "orange", 
        "rotten apple", "rotten banana", "rotten cabbage", 
        "rotten meat", "rotten orange", "rotten spinach", "spinach"
    ];

    // 初始化：加載 ONNX 模型
    useEffect(() => {
        async function initModel() {
            try {
                // 從 window 取得全域的 ort 引擎
                const ort = window.ort;
                if (!ort) {
                    console.error("❌ 找不到 AI 引擎元件，請確認 index.html 是否正確引入 ort.min.js");
                    return;
                }

                // 從環境取得基礎路徑，並加入 Version Hash 避免瀏覽器快取舊權重
                const baseUrl = import.meta.env.BASE_URL || "/";
                const modelUrl = `${baseUrl}best.onnx?v=${Date.now()}`;
                
                // 設定 ONNX Runtime WASM 零件經由 CDN 下載以確保版本一致與路徑正確
                const cdnUrl = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/";
                ort.env.wasm.wasmPaths = cdnUrl;
                ort.env.wasm.numThreads = 1;
                ort.env.wasm.proxy = false;

                // 載入模型 (優先嘗試 WebGL GPU 加速)
                const session = await ort.InferenceSession.create(modelUrl, {
                    executionProviders: ["webgl", "wasm"], 
                    graphOptimizationLevel: "all" 
                });
                
                sessionRef.current = session;
                setModelLoaded(true);
                console.log("✅ AI 大腦載入成功！");
            } catch (e) {
                console.error("❌ 模型載入失敗，具體錯誤內容:", e);
                if (e instanceof Error) {
                    console.error("錯誤訊息:", e.message);
                }
            }
        }
        initModel();
    }, []);

    const handleScan = async () => {
        if (!videoRef.current || !sessionRef.current) return;
        setIsScanning(true);
        setCurrentBoxes([]);
        clearTempDetections(); // 每次開始新掃描前，清空暫存清單，解決累加問題

        try {
            // 1. 擷取畫面並縮放至 640x640 (YOLO 標準尺寸)
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 640;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(videoRef.current, 0, 0, 640, 640);

            // 2. 影像前處理 (Image to Tensor)
            const imgData = ctx.getImageData(0, 0, 640, 640);
            const input = new Float32Array(3 * 640 * 640);
            for (let i = 0; i < 640 * 640; i++) {
                input[i] = imgData.data[i * 4] / 255.0; // R
                input[i + 640 * 640] = imgData.data[i * 4 + 1] / 255.0; // G
                input[i + 2 * 640 * 640] = imgData.data[i * 4 + 2] / 255.0; // B
            }
            const tensor = new window.ort.Tensor("float32", input, [1, 3, 640, 640]);

            // 3. 執行推理 (Run Inference)
            const feeds = { [sessionRef.current.inputNames[0]]: tensor };
            const results = await sessionRef.current.run(feeds);
            const outputView = results[sessionRef.current.outputNames[0]];
            const output = outputView.data as Float32Array;
            const dims = outputView.dims;

            // 4. 解析輸出 (Post-processing - Enhanced YOLOv8 parser)
            const detections: any[] = [];
            const CONF_THRESHOLD = settings.confidenceThreshold;
            
            console.log(`🧠 推理完成。輸出維度: [${dims.join(',')}], 資料長度: ${output.length}, 門檻: ${String(CONF_THRESHOLD)}`);
            
            const isTransposed = dims[1] > dims[2]; // 自動判斷行列排序 (YOLOv8 [1, 16, 8400] vs [1, 8400, 16])
            const numAnchors = isTransposed ? dims[1] : dims[2];
            const numChannels = isTransposed ? dims[2] : dims[1];
            
            let highestSeen = 0;

            for (let i = 0; i < numAnchors; i++) {
                let maxConf = 0;
                let classId = -1;

                // 找出該點最大信心的類別
                for (let c = 0; c < CLASS_NAMES.length; c++) {
                    const idx = isTransposed ? i * numChannels + (c + 4) : (c + 4) * numAnchors + i;
                    const conf = output[idx];
                    if (conf > maxConf) {
                        maxConf = conf;
                        classId = c;
                    }
                }

                if (maxConf > highestSeen) highestSeen = maxConf;

                if (maxConf > CONF_THRESHOLD) {
                    const cx = output[isTransposed ? i * numChannels : i];
                    const cy = output[isTransposed ? i * numChannels + 1 : numAnchors + i];
                    const w = output[isTransposed ? i * numChannels + 2 : numAnchors * 2 + i];
                    const h = output[isTransposed ? i * numChannels + 3 : numAnchors * 3 + i];

                    const x1 = (cx - w / 2) / 640;
                    const y1 = (cy - h / 2) / 640;
                    const x2 = (cx + w / 2) / 640;
                    const y2 = (cy + h / 2) / 640;

                    const name = CLASS_NAMES[classId];
                    const isSpoiled = name.toLowerCase().includes("rotten");
                    
                    let category = "其他";
                    if (name.includes("apple") || name.includes("orange") || name.includes("banana")) category = "水果";
                    if (name.includes("cabbage") || name.includes("spinach")) category = "蔬菜";
                    if (name.includes("meat")) category = "肉類";

                    detections.push({
                        name: name,
                        confidence: maxConf,
                        box: [x1, y1, x2, y2],
                        isSpoiled: isSpoiled,
                        category: category
                    });

                    // 增加偵測上限以利除錯
                    if (detections.length > 50) break;
                }
            }

            console.log(`📊 解析完成。最高信心值: ${highestSeen.toFixed(4)}, 有效目標數: ${detections.length}`);

            // 5. 執行 NMS (Non-Maximum Suppression) 過濾重複重疊的框
            const nmsDetections: any[] = [];
            const sortedDetections = detections.sort((a, b) => b.confidence - a.confidence);
            const IOU_THRESHOLD = 0.5;

            for (const det of sortedDetections) {
                let keep = true;
                for (const kept of nmsDetections) {
                    const interX1 = Math.max(det.box[0], kept.box[0]);
                    const interY1 = Math.max(det.box[1], kept.box[1]);
                    const interX2 = Math.min(det.box[2], kept.box[2]);
                    const interY2 = Math.min(det.box[3], kept.box[3]);
                    const interArea = Math.max(0, interX2 - interX1) * Math.max(0, interY2 - interY1);
                    const areaA = (det.box[2] - det.box[0]) * (det.box[3] - det.box[1]);
                    const areaB = (kept.box[2] - kept.box[0]) * (kept.box[3] - kept.box[1]);
                    const iou = interArea / (areaA + areaB - interArea);
                    if (iou > IOU_THRESHOLD) { keep = false; break; }
                }
                if (keep) {
                    nmsDetections.push(det);
                    if (nmsDetections.length >= 10) break;
                }
            }

            if (nmsDetections.length === 0) {
                notificationService.send("掃描完成", "未偵測到任何食材，請靠近一點或調整角度重試。");
            } else {
                setCurrentBoxes(nmsDetections);
                nmsDetections.forEach(det => addItem({
                    name: det.name,
                    quantity: 1,
                    category: det.category,
                    confidence: det.confidence,
                    isSpoiled: det.isSpoiled,
                    box: det.box
                }));
            }

        } finally {
            setIsScanning(false);
        }
    };

    const handleCloudScan = async () => {
        if (!videoRef.current) return;
        setIsCloudScanning(true);
        clearTempDetections();

        try {
            // 1. 擷取目前畫面 (Capture current frame)
            const canvas = document.createElement("canvas");
            canvas.width = 1280; // 高解析度以利 Gemini 辨識
            canvas.height = 720;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(videoRef.current, 0, 0, 1280, 720);
            
            const imageBase64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

            // 2. 調用 LLM Service
            const detections = await llmService.detectIngredients(imageBase64);

            if (detections.length === 0) {
                notificationService.send("AI 辨識完成", "Gemini 未能發現顯著食材，請確保光線充足。");
            } else {
                notificationService.send("✨ AI 偵測成功", `Gemini 發現了 ${detections.length} 件食材並已加入。`);
                
                // 3. 映射回 Store
                detections.forEach(det => addItem({
                    name: det.name,
                    quantity: 1,
                    category: det.category,
                    confidence: det.confidence,
                    isSpoiled: det.isSpoiled,
                    timestamp: Date.now()
                }));
            }
        } catch (error: any) {
            console.error("[Vision] Cloud Scan Error:", error);
            notificationService.send("辨識異常", "無法與 Cloud AI 通訊，請檢查 API 金鑰。");
        } finally {
            setIsCloudScanning(false);
        }
    };

    const handleClear = () => {
        clearTempDetections();
        setCurrentBoxes([]);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-sm">
            <div className="relative w-full">
                {/* AI Status Badge */}
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-[var(--background)]/80 backdrop-blur-md border ${!modelLoaded ? 'border-red-400' : isScanning ? 'border-amber-400' : 'border-[var(--primary)]'} rounded-full px-4 py-1.5 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-colors duration-500`}>
                    <div className={`w-2 h-2 rounded-full ${!modelLoaded ? 'bg-red-400' : isScanning ? 'bg-amber-400 animate-pulse' : 'bg-[var(--primary)]'} shadow-[0_0_8px_currentColor]`} />
                    <span className={`text-[10px] font-black tracking-widest ${!modelLoaded ? 'text-red-400' : isScanning ? 'text-amber-400' : 'text-[var(--primary)]'} uppercase`}>
                        {!modelLoaded ? "系統核心啟動中..." : isScanning ? "正在為您辨識..." : "掃描系統已就緒"}
                    </span>
                </div>

                {/* Camera View */}
                <div className="relative aspect-[3/4] bg-[var(--card)] rounded-[2.5rem] overflow-hidden border-4 border-[var(--card)] shadow-2xl">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Bounding Box Overlay */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {currentBoxes.map((boxData, idx) => boxData.box && (
                            <div
                                key={`box-${idx}`}
                                className="absolute"
                                style={{
                                    left: `${boxData.box[0] * 100}%`,
                                    top: `${boxData.box[1] * 100}%`,
                                    width: `${(boxData.box[2] - boxData.box[0]) * 100}%`,
                                    height: `${(boxData.box[3] - boxData.box[1]) * 100}%`,
                                    borderColor: boxData.isSpoiled ? '#ff4d4d' : 'var(--primary)',
                                    borderWidth: '2px',
                                    borderStyle: 'solid',
                                    borderRadius: '8px'
                                }}
                            >
                                <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded-t-md text-[8px] font-black uppercase whitespace-nowrap ${boxData.isSpoiled ? 'bg-red-500 text-white' : 'bg-[var(--primary)] text-[var(--background)]'}`}>
                                    {boxData.isSpoiled ? 'BAD' : 'GOOD'} | {boxData.name} | {Math.round((boxData.confidence || 0) * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/40 to-transparent pointer-events-none" />

                    {isScanning && (
                        <div className="absolute inset-0 bg-[var(--primary)]/5 flex flex-col items-center justify-center">
                            <div className="w-full h-[2px] bg-amber-400 shadow-[0_0_15px_#fbbf24] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                    )}
                </div>
            </div>

            {tempDetections.length > 0 && (
                <div className="w-full flex justify-end px-2 mb-2 mt-4">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase"
                    >
                        <RefreshCw size={12} />
                        重新整理畫面
                    </button>
                </div>
            )}

            <DetectionSummary readOnly={true} />

            <div className="w-full mt-8 flex flex-col gap-3 px-2">
                <button
                    onClick={handleScan}
                    disabled={isScanning || isCloudScanning || !modelLoaded}
                    className="w-full bg-[var(--card)] text-[var(--primary)] border border-[var(--primary)]/30 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[var(--card)]/80 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} strokeWidth={3} />}
                    {isScanning ? "正在為您分析..." : "本地 YOLO 高速掃描"}
                </button>

                <button
                    onClick={handleCloudScan}
                    disabled={isScanning || isCloudScanning}
                    className="group relative w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(139,92,246,0.3)] disabled:opacity-50 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    {isCloudScanning ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} className="group-hover:scale-110 transition-transform" />}
                    {isCloudScanning ? "CLOUD SYNTHESIZING..." : "Gemini Vision 深層辨識"}
                </button>
            </div>
        </div>
    );
}
