import Image from "next/image";
import { Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ObjectSelectionProps {
  object: {
    id: number;
    name: string;
    thumbnail: string;
    points: Array<{ x: number; y: number; frameNumber: number; isAddMode: boolean }>;
    boundingBoxes: Array<{ x: number; y: number; width: number; height: number; frameNumber: number; isAddMode: boolean }>;
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
  const [isAddMode, setIsAddMode] = useState(object.isAddMode !== undefined ? object.isAddMode : true);

  return (
    <>
      <div
        className={`bg-card rounded-md p-4 transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
        onClick={() => onSelect && onSelect()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Image
              src={object.thumbnail || "/placeholder.svg"}
              alt={object.name}
              width={40}
              height={40}
              className="rounded-md bg-primary"
            />
            <h3 className="font-medium text-foreground">{object.name}</h3>
          </div>

          {showDeleteButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Remove object</span>
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          <p>
            Select <span className="text-primary">⊕</span> to add areas to the
            object and
            <span className="text-destructive"> ⊖</span> to remove areas from the
            object in the video. Click on an existing point to delete it.
          </p>
        </div>
        <div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={`flex-1 ${isAddMode ? 'bg-primary/10 hover:bg-primary/20' : 'bg-muted hover:bg-muted/80'}`}
              onClick={() => {
                setIsAddMode(true);
                if (object.isAddMode !== undefined) {
                  object.isAddMode = true;
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2 text-primary" />
              Add
            </Button>
            <Button
              variant="outline"
              className={`flex-1 ${!isAddMode ? 'bg-destructive/10 hover:bg-destructive/20' : 'bg-muted hover:bg-muted/80'}`}
              onClick={() => {
                setIsAddMode(false);
                if (object.isAddMode !== undefined) {
                  object.isAddMode = false;
                }
              }}
            >
              <Minus className="w-4 h-4 mr-2 text-destructive" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
