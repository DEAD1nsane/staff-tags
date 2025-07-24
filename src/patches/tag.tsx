import { after } from "somewhere";
import { findByProps, findInReactTree } from "somewhere-else";

const Tag = findByProps("getBotLabel");

export default () =>
  after("default", Tag, ([{ text, textColor, backgroundColor }], ret) => {
    const label = findInReactTree(ret, (c) => typeof c.props.children === "string");
    // rest of the logic
  });