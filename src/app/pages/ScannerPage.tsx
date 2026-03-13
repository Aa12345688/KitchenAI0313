import { useNavigate } from "react-router";
import { CameraView } from "../components/scanner/CameraView";
import { DetectionSummary } from "../components/inventory_management/DetectionSummary";
import { useCamera } from "../hooks/useCamera";

export function ScannerPage() {
    const navigate = useNavigate();
    const { videoRef } = useCamera();

    return (
        <div className="pb-24">
            <div className="flex flex-col items-center justify-center px-6 pt-12 pb-4">
                <CameraView videoRef={videoRef} />
                <DetectionSummary />
                <p className="text-center text-gray-400 text-xs mt-8 px-10 leading-relaxed uppercase tracking-widest font-medium opacity-60">
                    將鏡頭對準食材<br />AI 將自動辨識並同步庫存
                </p>
            </div>
        </div>
    );
}
