import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Square } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

export function VoiceRecorder({ onRecordingComplete, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        onRecordingComplete(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex justify-center gap-4 items-center">
      {!isRecording ? (
        <Button onClick={startRecording} disabled={isProcessing}>
          <Mic className="mr-2 h-4 w-4" /> Start Recording
        </Button>
      ) : (
        <Button onClick={stopRecording} variant="destructive">
          <Square className="mr-2 h-4 w-4" /> Stop
        </Button>
      )}

      {isProcessing && <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />}
    </div>
  );
}
