"use server";

import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../stack";

export default async function Handler(props: unknown) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
