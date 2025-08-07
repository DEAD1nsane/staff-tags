import { before } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";

const UserBadges = findByName("UserBadges", false);
let unpatch: () => void;

function isStaff(userId: string): boolean {
    return [
        "288054683161853952" // Add more IDs if needed
    ].includes(userId);
}

export const onLoad = () => {
    console.log("✅ Staff Tags loaded");
    unpatch = before("default", UserBadges, ([props]) => {
        const { user } = props;
        if (user && isStaff(user.id)) {
            console.log("👨‍💼 Staff member detected:", user.id);
            // Here you could inject a badge or tag component
        }
    });
};

export const onUnload = () => {
    console.log("🛑 Staff Tags unloaded");
    unpatch?.();
};