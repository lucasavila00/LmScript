import { cn } from "../../lib/utils";
import { FC, memo, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { VariablesSidebar } from "./VariablesSidebar";
import { useVariables } from "../hooks/useVariables";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "../../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/ui/input";
import { useSamplingParams } from "../hooks/useSamplingParams";
import { SamplingParams } from "../lib/types";
import { BackendSetup } from "./BackendSetup";
import { useBackendConfig } from "../hooks/useBackendConfig";

const SamplingParamsForm: FC<{
  samplingParamsHook: ReturnType<typeof useSamplingParams>;
}> = ({ samplingParamsHook }) => {
  const form = useForm<SamplingParams>({
    resolver: zodResolver(SamplingParams),
    defaultValues: samplingParamsHook.samplingParams,
    mode: "onChange",
  });
  const setSamplingParamsRef = useRef(samplingParamsHook.setSamplingParams);
  setSamplingParamsRef.current = samplingParamsHook.setSamplingParams;
  useEffect(() => {
    const subscription = form.watch((v) => {
      const temperature = v.temperature;
      if (temperature != null) {
        setSamplingParamsRef.current({ ...v, temperature });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
        }}
        className="space-y-8 mt-8"
      >
        <FormField
          control={form.control}
          name="temperature"
          render={({ field: { onChange, ...restField } }) => (
            <FormItem>
              <FormLabel>Temperature</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Set a temperature"
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  step={0.01}
                  {...restField}
                />
              </FormControl>
              <FormDescription>
                Controls the “creativity” or randomness. A higher temperature
                (e.g., 0.7) results in more creative output, while a lower
                temperature (e.g., 0.2) makes the output more deterministic.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="top_p"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Top P</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="configure..."
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  step={0.01}
                  value={value ?? ""}
                  {...restField}
                />
              </FormControl>
              <FormDescription>TODO top_p desc</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="top_k"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Top K</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="configure..."
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  step={0.01}
                  value={value ?? ""}
                  {...restField}
                />
              </FormControl>
              <FormDescription>TODO top_k desc</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="frequency_penalty"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Frequency Penalty</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="configure..."
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  step={0.01}
                  value={value ?? ""}
                  {...restField}
                />
              </FormControl>
              <FormDescription>TODO frequency_penalty desc</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="presence_penalty"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Presence Penalty</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="configure..."
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                  }}
                  step={0.01}
                  value={value ?? ""}
                  {...restField}
                />
              </FormControl>
              <FormDescription>TODO presence_penalty desc</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
const EditModeSidebar: FC<{
  editor: Editor;
  variablesHook: ReturnType<typeof useVariables>;
  samplingParamsHook: ReturnType<typeof useSamplingParams>;
}> = ({ editor, variablesHook, samplingParamsHook }) => {
  return (
    <Tabs defaultValue="variables">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="variables">Variables</TabsTrigger>
        <TabsTrigger value="settings">Sampling</TabsTrigger>
      </TabsList>
      <TabsContent value="variables">
        <VariablesSidebar variablesHook={variablesHook} />
      </TabsContent>
      <TabsContent value="settings">
        <SamplingParamsForm samplingParamsHook={samplingParamsHook} />
        <Button
          className="mt-20"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log(
              JSON.stringify({
                variables: variablesHook.variables,
                doc: editor.getJSON(),
                samplingParams: samplingParamsHook.samplingParams,
              }),
            );
          }}
        >
          TODO CONSOLE PRINT
        </Button>
      </TabsContent>
    </Tabs>
  );
};
export const RightSidebar = memo<{
  editor: Editor;
  isOpen: boolean;
  variablesHook: ReturnType<typeof useVariables>;
  samplingParamsHook: ReturnType<typeof useSamplingParams>;
  isExecuting: boolean;
  backendConfigHook: ReturnType<typeof useBackendConfig>;
  onClose: () => void;
}>(
  ({
    backendConfigHook,
    isExecuting,
    editor,
    isOpen,
    variablesHook,
    samplingParamsHook,
    onClose,
  }) => {
    const windowClassName = cn(
      "absolute top-0 right-0 bg-white h-full lg:h-auto lg:relative z-[999] w-0 duration-300 transition-all",
      "dark:bg-black",
      !isOpen && "border-l-transparent",
      isOpen && "w-80 border-l border-l-neutral-200 dark:border-l-neutral-800",
    );

    return (
      <>
        <div
          className={cn(
            "w-full h-full absolute left-0 top-0 transition duration-300 lg:pointer-events-none",
            isOpen
              ? "backdrop-blur lg:backdrop-blur-none"
              : "backdrop-blur-none pointer-events-none",
          )}
          onClick={onClose}
        ></div>

        <div className={windowClassName}>
          <div className="w-full h-full overflow-hidden">
            <div className="w-full h-full min-w-80 w-80 p-6 overflow-auto">
              {isExecuting ? (
                <BackendSetup backendConfigHook={backendConfigHook} />
              ) : (
                <EditModeSidebar
                  editor={editor}
                  variablesHook={variablesHook}
                  samplingParamsHook={samplingParamsHook}
                />
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
);
