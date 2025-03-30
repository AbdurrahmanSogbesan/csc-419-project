import { ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useUploadImage } from "@/hooks/books";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  className?: string;
  previewClassName?: string;
}

const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

export const ImageUpload = ({
  value,
  onChange,
  onRemove,
  className,
  previewClassName,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadImage, isPending } = useUploadImage((data) => {
    onChange(data.url);
  });

  const validateFile = (file: File) => {
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return false;
    }

    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      toast.error("Please upload an image file");
      return false;
    }

    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = "";
      return;
    }

    // Upload file immediately
    uploadImage(file);
  };

  const handleRemove = () => {
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn(className)}>
      <input
        type="file"
        accept="image/jpeg, image/png, image/jpg"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Book cover"
            className={cn(
              "rounded-lg border border-gray-200 object-cover",
              previewClassName,
            )}
          />
          <Button
            type="button"
            size="icon"
            className="absolute right-2 top-2 rounded-full bg-transparent backdrop-blur-md transition-all duration-300 hover:scale-110"
            onClick={handleRemove}
          >
            <X className="size-4 font-medium" />
          </Button>
        </div>
      ) : isPending ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50",
            previewClassName,
          )}
        >
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Image
        </Button>
      )}
    </div>
  );
};
