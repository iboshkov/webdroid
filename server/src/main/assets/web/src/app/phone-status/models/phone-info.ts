export interface OSInfo {
    base_os: string;
    release: string;
    incremental: string;
    codename: string;
}

export interface PhoneInfo {
    model?: string;
    brand?: string;
    device?: string;
    manufacturer?: string;
    product?: string;
    host?: string;
    os?: OSInfo;
}