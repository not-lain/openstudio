import Image from "next/image";
import { Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react"; // Add this import

interface ObjectSelectionProps {
  object: {
    id: number;
    name: string;
    thumbnail: string;
    points: Array<{x: number; y: number; frameNumber: number; isAddMode: boolean}>;
    boundingBoxes: Array<{x: number; y: number; width: number; height: number; frameNumber: number; isAddMode: boolean}>;
    isAddMode?: boolean;
  };
  onRemove: () => void;
  showDeleteButton?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function ObjectSelection({
  object,
  onRemove,
  showDeleteButton = false,
  onSelect,
  isSelected = false,
}: ObjectSelectionProps) {
  // Use the isAddMode from the object if available, otherwise use local state
  const [isAddMode, setIsAddMode] = useState(object.isAddMode !== undefined ? object.isAddMode : true);

  return (
    <>
      <div
        className={`bg-gray-950 rounded-md p-4 transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950' : ''}`}
        onClick={() => onSelect && onSelect()}
      >
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
        <div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={`flex-1 ${isAddMode ? 'bg-blue-900 hover:bg-blue-800' : 'bg-gray-800 hover:bg-gray-700'} border-0`}
              onClick={() => {
                setIsAddMode(true);
                // Update the object's isAddMode property
                if (object.isAddMode !== undefined) {
                  object.isAddMode = true;
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2 text-blue-400" />
              Add
            </Button>
            <Button
              variant="outline"
              className={`flex-1 ${!isAddMode ? 'bg-red-900 hover:bg-red-800' : 'bg-gray-800 hover:bg-gray-700'} border-0`}
              onClick={() => {
                setIsAddMode(false);
                // Update the object's isAddMode property
                if (object.isAddMode !== undefined) {
                  object.isAddMode = false;
                }
              }}
            >
              <Minus className="w-4 h-4 mr-2 text-red-400" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
