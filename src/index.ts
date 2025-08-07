import React from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { storage, components } from "@vendetta";

const { FormRow, FormText, FormInput, FormSwitch } = components;
const UserBadges = findByName("UserBadges", false);

let unpatchBadges;

const STORAGE_KEY = "staffTags.settings";

interface Settings {
    staffIds: string[];
    showBadge: boolean;
}

const defaultSettings: Settings = {
    staffIds: ["288054683161853952"],
    showBadge: true,
};

let settings: Settings = { ...defaultSettings };

// Load settings from storage
function loadSettings(): Settings {
    try {
        const stored = storage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validate and merge with defaults
            settings = {
                staffIds: Array.isArray(parsed.staffIds) ? parsed.staffIds : defaultSettings.staffIds,
                showBadge: typeof parsed.showBadge === 'boolean' ? parsed.showBadge : defaultSettings.showBadge,
            };
        }
    } catch (error) {
        console.error("Failed to load staff tags settings:", error);
        settings = { ...defaultSettings };
    }
    return settings;
}

// Save settings to storage
function saveSettings(): void {
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save staff tags settings:", error);
    }
}

// Check if user is staff
function isStaff(userId: string): boolean {
    return settings.staffIds.includes(userId);
}

// Patch UserBadges to add STAFF badge
function patchUserBadges(): void {
    if (!UserBadges) {
        console.warn("UserBadges component not found, cannot patch badges");
        return;
    }
    
    try {
        unpatchBadges = before("default", UserBadges, ([props]) => {
            if (!settings.showBadge) return;
            if (!props?.user?.id) return;
            
            if (isStaff(props.user.id)) {
                // Ensure badges array exists
                if (!Array.isArray(props.badges)) {
                    props.badges = [];
                }
                
                // Create staff badge element with proper key
                const staffBadge = React.createElement("span", {
                    key: `staff-badge-${props.user.id}`,
                    style: {
                        color: "#7289da",
                        fontWeight: "bold",
                        marginLeft: 6,
                        fontSize: 12,
                        userSelect: "none",
                    },
                }, "STAFF");
                
                // Check if staff badge already exists to prevent duplicates
                const hasStaffBadge = props.badges.some(badge =>
                    badge?.key === `staff-badge-${props.user.id}`
                );
                
                if (!hasStaffBadge) {
                    props.badges.push(staffBadge);
                }
            }
        });
    } catch (error) {
        console.error("Failed to patch UserBadges:", error);
    }
}

// Settings UI component
function SettingsScreen() {
    // Initialize state with current settings
    const [staffIds, setStaffIds] = React.useState(settings.staffIds.join("\n"));
    const [showBadge, setShowBadge] = React.useState(settings.showBadge);
    
    // Update settings and save
    const updateSettings = React.useCallback((newStaffIds ? : string, newShowBadge ? : boolean) => {
        if (typeof newShowBadge === 'boolean') {
            settings.showBadge = newShowBadge;
        }
        
        if (typeof newStaffIds === 'string') {
            settings.staffIds = newStaffIds
                .split("\n")
                .map((id) => id.trim())
                .filter((id) => id.length > 0 && /^\d+$/.test(id)); // Validate Discord ID format
        }
        
        saveSettings();
    }, []);
    
    const handleShowBadgeChange = React.useCallback((value: boolean) => {
        setShowBadge(value);
        updateSettings(undefined, value);
    }, [updateSettings]);
    
    const handleStaffIdsChange = React.useCallback((text: string) => {
        setStaffIds(text);
    }, []);
    
    const handleStaffIdsSave = React.useCallback(() => {
        updateSettings(staffIds, undefined);
    }, [staffIds, updateSettings]);
    
    return React.createElement(components.ScrollView, {
        style: { flex: 1 }
    }, [
        React.createElement(FormRow, {
            key: "toggle-row"
        }, React.createElement(FormSwitch, {
            value: showBadge,
            onValueChange: handleShowBadgeChange,
            label: "Show STAFF Badge",
            subLabel: "Toggle visibility of the STAFF badge for specified users"
        })),
        
        React.createElement(FormRow, {
            key: "input-row"
        }, [
            React.createElement(FormText, {
                key: "label",
                children: "Staff User IDs (one per line)"
            }),
            React.createElement(FormInput, {
                key: "input",
                multiline: true,
                numberOfLines: 6,
                placeholder: "Enter Discord user IDs, one per line...\nExample:\n288054683161853952\n123456789012345678",
                value: staffIds,
                onChangeText: handleStaffIdsChange,
                onBlur: handleStaffIdsSave,
                style: {
                    minHeight: 120,
                    textAlignVertical: 'top'
                }
            })
        ])
    ]);
}

export const onLoad = (): void => {
    try {
        loadSettings();
        patchUserBadges();
        console.log("✅ Staff Tags plugin loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load Staff Tags plugin:", error);
    }
};

export const onUnload = (): void => {
    try {
        unpatchBadges?.();
        console.log("🛑 Staff Tags plugin unloaded successfully");
    } catch (error) {
        console.error("❌ Failed to unload Staff Tags plugin:", error);
    }
};

export const settings = SettingsScreen;