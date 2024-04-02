import { assertIsNever } from "../../lib/utils";
import { FC, memo, useState } from "react";
import { useBackendConfig } from "../hooks/useBackendConfig";
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
import { ALL_CHAT_TEMPLATES, ChatTemplate } from "@lmscript/client/chat-template";
import { Label } from "../../components/ui/label";
import {
  ALL_BACKENDS_TAGS,
  Backend,
  BackendLabels,
  BackendTag,
} from "@lmscript/editor-tools/backend-config";
const RunpodSglangConfigSchema = z.object({
  url: z.string().min(4),
  token: z.string(),
  template: z.enum(ALL_CHAT_TEMPLATES),
});
export const SelectChatTemplate: FC<{
  value: ChatTemplate | undefined;
  onChange: (value: ChatTemplate | undefined) => void;
}> = ({ value, onChange }) => {
  return (
    <StyledReactSelect
      value={
        value == null
          ? undefined
          : {
              value: value,
              label: value,
            }
      }
      onChange={(it) => {
        onChange(it?.value);
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
  );
};

const CHAT_TEMPLATE_DESCRIPTION =
  "The chat template to use. This will be used to generate the chat. Each model has different chat templates.";
const UrlTokenTemplateConfig: FC<{
  setBackend: (backend: Backend) => void;
  tag: "runpod-serverless-sglang" | "sglang";
}> = ({ setBackend, tag }) => {
  const form = useForm<z.infer<typeof RunpodSglangConfigSchema>>({
    resolver: zodResolver(RunpodSglangConfigSchema),
    defaultValues: {
      url: "http://localhost:8000",
      token: "",
      template: "mistral",
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
              <FormDescription>The URL of the Endpoint.</FormDescription>
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
                <SelectChatTemplate value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>{CHAT_TEMPLATE_DESCRIPTION}</FormDescription>
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

const VllmConfigSchema = z.object({
  url: z.string().min(4),
  token: z.string(),
  template: z.enum(ALL_CHAT_TEMPLATES),
  model: z.string(),
});

const VllmConfig: FC<{
  setBackend: (backend: Backend) => void;
  tag: "vllm-openai";
}> = ({ setBackend, tag }) => {
  const form = useForm<z.infer<typeof VllmConfigSchema>>({
    resolver: zodResolver(VllmConfigSchema),
    defaultValues: {
      url: "http://localhost:8000",
      token: "",
      template: "mistral",
      model: "",
    },
  });

  function onSubmit(values: z.infer<typeof VllmConfigSchema>) {
    setBackend({
      tag: tag,
      url: values.url,
      token: values.token,
      template: values.template,
      model: values.model,
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
                <SelectChatTemplate value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>{CHAT_TEMPLATE_DESCRIPTION}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>
                The model to use. Your vLLM server must have this model available.
              </FormDescription>
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
    case "vllm-openai": {
      return <VllmConfig setBackend={setBackend} tag="vllm-openai" />;
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
        You can use any of the backends supported by{" "}
        <a href="https://github.com/lucasavila00/LmScript" target="_blank">
          LmScript
        </a>
        .
      </UnconnectedFormDescription>
      <BackendConfig setBackend={backendConfigHook.setBackend} backendTag={backendTag} />
    </>
  );
});
