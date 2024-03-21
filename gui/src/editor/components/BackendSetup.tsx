import { assertIsNever } from "../../lib/utils";
import { FC, memo, useState } from "react";
import {
  ALL_BACKENDS_TAGS,
  Backend,
  BackendLabels,
  BackendTag,
  useBackendConfig,
} from "../hooks/useBackendConfig";
import { StyledReactSelect } from "../../components/ui/react-select";
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
  UnconnectedFormDescription,
} from "../../components/ui/form";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useForm } from "react-hook-form";
import { ALL_CHAT_TEMPLATES } from "@lmscript/client/chat-template";
import { Label } from "../../components/ui/label";
const RunpodSglangConfigSchema = z.object({
  url: z.string().min(4),
  token: z.string(),
  template: z.enum(ALL_CHAT_TEMPLATES),
});

const UrlTokenTemplateConfig: FC<{
  setBackend: (backend: Backend) => void;
  tag: "runpod-serverless-sglang" | "sglang";
}> = ({ setBackend, tag }) => {
  const form = useForm<z.infer<typeof RunpodSglangConfigSchema>>({
    resolver: zodResolver(RunpodSglangConfigSchema),
    defaultValues: {
      url: "http://localhost:8000",
      token: "",
      template: "llama-2-chat",
    },
  });

  function onSubmit(values: z.infer<typeof RunpodSglangConfigSchema>) {
    setBackend({
      tag: tag,
      url: values.url,
      token: values.token,
      template: values.template,
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
              <FormDescription>The URL of the Runpod Serverless Endpoint.</FormDescription>
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
        <FormField
          control={form.control}
          name="template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chat Template</FormLabel>
              <FormControl>
                <StyledReactSelect
                  value={
                    field.value == null
                      ? undefined
                      : {
                          value: field.value,
                          label: field.value,
                        }
                  }
                  onChange={(it) => {
                    field.onChange(it?.value);
                  }}
                  isClearable={false}
                  placeholder="Select a chat template..."
                  classNames={{
                    control: () => "!min-h-9",
                    container: () => "!min-h-9 mt-2",
                  }}
                  options={ALL_CHAT_TEMPLATES.map((template) => ({
                    value: template,
                    label: template,
                  }))}
                />
              </FormControl>
              <FormDescription>TODO template desc.</FormDescription>
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
      return <UrlTokenTemplateConfig setBackend={setBackend} tag="runpod-serverless-sglang" />;
    }
    case "runpod-serverless-vllm": {
      return <>TODO vllm</>;
    }
    case "sglang": {
      return <UrlTokenTemplateConfig setBackend={setBackend} tag="sglang" />;
    }
    default: {
      return assertIsNever(backendTag);
    }
  }
};
export const BackendSetup = memo<{
  backendConfigHook: ReturnType<typeof useBackendConfig>;
}>(({ backendConfigHook }) => {
  const [backendTag, setBackendTag] = useState<BackendTag | undefined>(
    backendConfigHook.backend?.tag,
  );

  return (
    <>
      <Label>Backend</Label>
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
        classNames={{
          control: () => "!min-h-9",
          container: () => "!min-h-9 mt-2",
        }}
      />
      <UnconnectedFormDescription className="mt-2">
        TODO describe backend
      </UnconnectedFormDescription>
      <BackendConfig setBackend={backendConfigHook.setBackend} backendTag={backendTag} />
    </>
  );
});
