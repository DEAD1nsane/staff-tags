import { after, unpatchAll } from "@vendetta/patcher";

// Patch modules
import patchChat from "./patches/chat";
import patchDetails from "./patches/details";
import patchName from "./patches/name";
import patchSidebar from "./patches/sidebar";

let unpatchers: Array < () => void > = [];

export const onLoad = () => {
    unpatchers.push(patchChat());
    unpatchers.push(patchDetails());
    unpatchers.push(patchName());
    unpatchers.push(patchSidebar());
    console.log("✅ Staff Tags with all patches loaded");
};

export const onUnload = () => {
    unpatchers.forEach((u) => u && u());
    unpatchAll();
    console.log("🛑 Staff Tags patches unloaded");
};