import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={handleClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 mr-4">
                  <Zap className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                </div>
                <div>
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    {title}
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {type === "title" 
                      ? "Here are some title suggestions based on your content:" 
                      : "Here is a summary suggestion based on your content:"}
                  </p>
                </div>
              </div>

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
                              <input 
                                type="radio" 
                                value={suggestion}
                                checked={selectedSuggestion === suggestion}
                                onChange={() => setSelectedSuggestion(suggestion)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                              />
                              <Label className="ml-3 text-gray-700 dark:text-gray-300 cursor-pointer">
                                {suggestion}
                              </Label>
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
                <div className="mt-6 flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApply} 
                    disabled={isLoading || !selectedSuggestion}
                  >
                    Apply Selected
                  </Button>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AISuggestionModal;
