const { React } = require("@vendetta/metro/common");
const { before } = require("@vendetta/patcher");
const { findByName } = require("@vendetta/metro");

const UserBadges = findByName("UserBadges", false);

let unpatch;

const staffIds = [
    "288054683161853952", // your user ID
    // add more IDs here
];

function isStaff(userId: string): boolean {
    return staffIds.includes(userId);
}

export const onLoad = () => {
    unpatch = before("default", UserBadges, ([props]) => {
        const { user, badges } = props;
        if (!user || !isStaff(user.id)) return;
        
        badges.push(
            React.createElement("span", {
                style: {
                    backgroundColor: "#5865F2",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginLeft: 4,
                    fontSize: 12,
                    fontWeight: "bold"
                }
            }, "STAFF")
        );
    });
};

export const onUnload = () => {
    unpatch?.();
};