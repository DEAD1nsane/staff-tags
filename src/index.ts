import { settings } from "@vendetta/plugkit";
import { registerSettingsPage } from "@vendetta/ui";
import patchSidebar from "./patches/sidebar";
import patchChat from "./patches/chat";
import patchTags from "./patches/tags";
import patchName from "./patches/name";
import patchDetails from "./patches/details";
import Settings from "./ui/pages/Settings";

const patches = [];

export const onLoad = () => {
    patches.push(
        patchSidebar(),
        patchChat(),
        patchTags(),
        patchName(),
        patchDetails()
    );
    
    registerSettingsPage(Settings);
};

export const onUnload = () => {
    for (const unpatch of patches) unpatch?.();
};