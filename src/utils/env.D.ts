import type { TypedPocketBase } from "./type";

declare global {
    namespace App {
        interface Locals {
            pb: TypedPocketBase,
        }
    }
}