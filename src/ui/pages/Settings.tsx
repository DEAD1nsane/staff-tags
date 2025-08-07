import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms, General } from "@vendetta/ui/components";
const { ScrollView } = General;
const { FormSection, FormSwitchRow } = Forms;

export default function Settings() {
    useProxy(storage);
    
    return (
        <ScrollView>
      <FormSection title="Staff Tags Settings">
        <FormSwitchRow
          label="Use Role Color"
          description="Toggle tag color based on user role color"
          value={storage.useRoleColor}
          onValueChange={(v: boolean) => {
            storage.useRoleColor = v;
          }}
        />
      </FormSection>
    </ScrollView>
    );
}