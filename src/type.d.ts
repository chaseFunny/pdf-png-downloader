// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyIfEmpty<T> = keyof T extends never ? any : T;
type downloadType = "png" | "pdf" | "jpeg";
