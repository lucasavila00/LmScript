import { assertIsNever, cn } from "@/lib/utils";
import { FC, memo, useState } from "react";
import { Editor } from "@tiptap/react";
import {
  ALL_BACKENDS_TAGS,
  Backend,
  BackendLabels,
  BackendTag,
  useRunner,
} from "../hooks/useRunner";
import { StyledReactSelect } from "@/components/ui/react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
const RunpodSglangConfigSchema = z.object({
  url: z.string().min(4),
  token: z.string(),
});

const RunpodSglangConfig: FC<{
  setBackend: (tag: Backend) => void;
}> = ({ setBackend }) => {
  const form = useForm<z.infer<typeof RunpodSglangConfigSchema>>({
    resolver: zodResolver(RunpodSglangConfigSchema),
    defaultValues: {
      url: "http://localhost:8000",
      token: "",
    },
  });

  function onSubmit(values: z.infer<typeof RunpodSglangConfigSchema>) {
    setBackend({
      tag: "runpod-serverless-sglang",
      url: values.url,
      token: values.token,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="http://localhost:8000" {...field} />
              </FormControl>
              <FormDescription>
                The URL of the Runpod Serverless Endpoint.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>Leave empty if running locally.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="outline" type="submit" className="w-full">
          Save
        </Button>
      </form>
    </Form>
  );
};
const BackendConfig: FC<{
  backendTag: BackendTag | undefined;
  setBackend: (tag: Backend) => void;
}> = ({ backendTag, setBackend }) => {
  if (backendTag == null) return <></>;
  switch (backendTag) {
    case "runpod-serverless-sglang": {
      return <RunpodSglangConfig setBackend={setBackend} />;
    }
    case "runpod-serverless-vllm": {
      return "todo";
    }
    case "sglang": {
      return "todo";
    }
    default: {
      return assertIsNever(backendTag);
    }
  }
};
export const LeftSidebar = memo<{
  editor: Editor;
  isOpen: boolean;
  runnerHook: ReturnType<typeof useRunner>;
}>(({ isOpen, runnerHook }) => {
  const windowClassName = cn(
    "absolute top-0 left-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative z-[999] w-0 duration-300 transition-all",
    "dark:bg-black lg:dark:bg-black/30",
    !isOpen && "border-r-transparent",
    isOpen && "w-80 border-r border-r-neutral-200 dark:border-r-neutral-800",
  );

  const [backendTag, setBackendTag] = useState<BackendTag | undefined>(
    runnerHook.backend?.tag,
  );

  return (
    <div className={windowClassName}>
      <div className="w-full h-full overflow-hidden">
        <div className="w-full h-full p-6 overflow-auto">
          TODO backend label
          <StyledReactSelect
            value={
              backendTag == null
                ? null
                : {
                    value: backendTag,
                    label: BackendLabels[backendTag],
                  }
            }
            options={ALL_BACKENDS_TAGS.map((backend) => ({
              value: backend,
              label: BackendLabels[backend],
            }))}
            isClearable={false}
            onChange={(selected) => {
              setBackendTag(selected?.value);
            }}
            placeholder="Select a backend..."
          />
          <BackendConfig
            setBackend={runnerHook.setBackend}
            backendTag={backendTag}
          />
        </div>
      </div>
    </div>
  );
});
