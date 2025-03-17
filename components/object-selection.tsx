import Image from "next/image";
import { Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ObjectSelectionProps {
  object: {
    id: number;
    name: string;
    thumbnail: string;
  };
  onRemove: () => void;
  showDeleteButton?: boolean;
}

export default function ObjectSelection({
  object,
  onRemove,
  showDeleteButton = false,
}: ObjectSelectionProps) {
  return (
    <div className="bg-gray-950 rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Image
            src={object.thumbnail || "/placeholder.svg"}
            alt={object.name}
            width={40}
            height={40}
            className="rounded-md bg-blue-500"
          />
          <h3 className="font-medium">{object.name}</h3>
        </div>

        {showDeleteButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 rounded-full hover:bg-gray-800"
          >
            <X className="h-4 w-4 text-gray-400" />
            <span className="sr-only">Remove object</span>
          </Button>
        )}
      </div>

      <div className="text-sm text-gray-400 mb-4">
        <p>
          Select <span className="text-blue-400">⊕</span> to add areas to the
          object and
          <span className="text-red-400"> ⊖</span> to remove areas from the
          object in the video. Click on an existing point to delete it.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 bg-gray-800 hover:bg-gray-700 border-0"
        >
          <Plus className="w-4 h-4 mr-2 text-blue-400" />
          Add
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-gray-800 hover:bg-gray-700 border-0"
        >
          <Minus className="w-4 h-4 mr-2 text-red-400" />
          Remove
        </Button>
      </div>
    </div>
  );
}
