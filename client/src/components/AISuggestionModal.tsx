import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "title" | "summary";
  suggestions: string[] | string;
  isLoading: boolean;
  onSelectSuggestion: (suggestion: string) => void;
}

const AISuggestionModal: React.FC<AISuggestionModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  suggestions,
  isLoading,
  onSelectSuggestion
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");

  const handleApply = () => {
    if (!selectedSuggestion) return;
    onSelectSuggestion(selectedSuggestion);
    onClose();
  };

  const handleClose = () => {
    setSelectedSuggestion("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center mb-2">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 mr-3">
              <Zap className="h-5 w-5 text-primary-600 dark:text-primary-300" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {type === "title" 
              ? "Here are some title suggestions based on your content:" 
              : "Here is a summary suggestion based on your content:"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {type === "title" 
                ? Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center p-3 rounded-md border border-gray-200 dark:border-gray-700">
                      <Skeleton className="h-4 w-4 mr-3 rounded-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))
                : <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
              }
            </div>
          ) : (
            <>
              {type === "title" && Array.isArray(suggestions) ? (
                <RadioGroup value={selectedSuggestion} onValueChange={setSelectedSuggestion}>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center p-3 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          selectedSuggestion === suggestion 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-800' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={suggestion} id={`suggestion-${index}`} />
                          <Label 
                            htmlFor={`suggestion-${index}`} 
                            className="font-normal text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            {suggestion}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                  <p className="text-gray-700 dark:text-gray-300">{suggestions as string}</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      setSelectedSuggestion(suggestions as string);
                      onSelectSuggestion(suggestions as string);
                      onClose();
                    }}
                  >
                    Use This Summary
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {type === "title" && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={isLoading || !selectedSuggestion}
            >
              Apply Selected
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AISuggestionModal;
