"use client";

import { ChangeEvent, useMemo } from "react";

type PhotoUploadProps = {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  label: string;
};

export function PhotoUpload({ file, onFileSelect, label }: PhotoUploadProps) {
  const previewUrl = useMemo(() => {
    if (!file) {
      return "";
    }
    return URL.createObjectURL(file);
  }, [file]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    onFileSelect(nextFile);
  }

  return (
    <div className="card">
      <label className="mb-3 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
      />
      {file ? <p className="mt-2 text-xs text-slate-500">Selected: {file.name}</p> : null}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Selected preview"
          className="mt-4 h-64 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mt-4 grid h-64 place-items-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
          Upload an image to preview
        </div>
      )}
    </div>
  );
}
