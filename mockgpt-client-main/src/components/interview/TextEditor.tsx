import { Code, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const TextEditorModal = ({
  socketRef,
}: {
  socketRef: React.MutableRefObject<WebSocket | null> | undefined;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [code, setCode] = useState<string>(
    "/* Write your Code below */\nconsole.log('Hello World')"
  );

  const handleCodeSubmit = (code: string) => {
    setIsOpen(false);

    // Sending code to ws server for response and review
    socketRef?.current?.send(JSON.stringify({ type: "code", data: code }));

    setCode("/* Write your Code below */\nconsole.log('Hello World')");
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="absolute right-3 top-3">
          <div className="w-16 h-10 text-black bg-white rounded-lg flex justify-center items-center gap-2 p-2 cursor-pointer ">
            <Pencil size={16} />
            <Code size={16} />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-full overflow-hidden p-0 bg-[#282C34]">
        <DialogHeader className="p-4 border-b border-[#2D2D2D]">
          <DialogTitle className="m-auto w-full text-white">
            Code Editor
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[calc(90vh-120px)]">
          <div className="flex-grow overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full overflow-auto">
              <CodeMirror
                value={code}
                theme={"dark"}
                height="70vh"
                extensions={[
                  javascript({ jsx: true }),
                  EditorView.lineWrapping,
                ]}
                onChange={(text) => setCode(text)}
              />
            </div>
          </div>
          <div className="flex justify-end  items-center p-4 border-t border-gray-700 text-white text-xs">
            <div className="flex gap-4 ">
              <Button onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                variant={"secondary"}
                onClick={() => handleCodeSubmit(code)}
              >
                Submit Code
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditorModal;
