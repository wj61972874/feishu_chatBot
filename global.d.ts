// src/global.d.ts

declare module "*.svg";

interface Window {
    tt: {
        getSystemInfo: (options: {
            success: (res: any) => void;
            fail?: (res: any) => void;
        }) => void;
        showModal: (options: {
            title: string;
            content: string;
            confirmText: string;
            cancelText?: string;
            success?: (res: any) => void;
            fail?: (res: any) => void;
            complete?: (res: any) => void;
        }) => void;
        showActionSheet: (options: {
            itemList: string[];
            success?: (res: any) => void;
            fail?: (res: any) => void;
        }) => void;
        previewImage: (options: {
            urls: string[];
            current?: string;
            success?: (res: any) => void;
            fail?: (res: any) => void;
        }) => void;
    };
}