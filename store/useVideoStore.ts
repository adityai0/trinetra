import { create } from 'zustand';

import type { CameraOption, Detection } from '@/types';

interface VideoState {
  cameras: CameraOption[];
  selectedCameraId: string;
  isStreaming: boolean;
  detections: Detection[];
  setSelectedCamera: (cameraId: string) => void;
  setStreaming: (streaming: boolean) => void;
  setDetections: (detections: Detection[]) => void;
}

const defaultCameras: CameraOption[] = [
  { id: 'cam-1', label: 'Entrance' },
  { id: 'cam-2', label: 'Warehouse' },
  { id: 'cam-3', label: 'Cash Counter' },
];

export const useVideoStore = create<VideoState>((set) => ({
  cameras: defaultCameras,
  selectedCameraId: defaultCameras[0].id,
  isStreaming: false,
  detections: [],
  setSelectedCamera: (selectedCameraId) => set({ selectedCameraId }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setDetections: (detections) => set({ detections }),
}));
