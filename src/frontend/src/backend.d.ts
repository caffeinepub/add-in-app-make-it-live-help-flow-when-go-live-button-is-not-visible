import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
    points: bigint;
    avatar: string;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFixture(teamName: string, fixture: string): Promise<boolean>;
    addPost(teamName: string, post: string): Promise<boolean>;
    addPrediction(teamName: string, prediction: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkTickerTimer(): Promise<boolean>;
    createHub(userId: string, teamName: string): Promise<boolean>;
    generateInviteCode(): Promise<string>;
    getAllHubs(): Promise<Array<[string, string]>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardData(teamName: string): Promise<{
        teamLogo?: ExternalBlob;
        teamColor: string;
        fanPredictions: Array<string>;
        fixtures: Array<string>;
        communityPosts: Array<[string, bigint]>;
        newsFeed: Array<string>;
        playerImages: Array<[string, ExternalBlob]>;
    }>;
    getFeatureSectionData(teamName: string): Promise<{
        teamLogo?: ExternalBlob;
        teamColor: string;
        fanPredictions: Array<string>;
        fixtures: Array<string>;
        communityPosts: Array<[string, bigint]>;
        newsFeed: Array<string>;
        playerImages: Array<[string, ExternalBlob]>;
    } | null>;
    getHub(userId: string): Promise<string | null>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getNewsTickerHeadlines(): Promise<Array<string>>;
    getNextFiveFixtures(teamName: string): Promise<Array<string>>;
    getPlayerRating(teamName: string, playerId: bigint): Promise<{
        count: bigint;
        average: number;
    }>;
    getTopRatedPlayers(teamName: string, limit: bigint): Promise<Array<[bigint, number, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    initializeTicker(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    migrateNewsTicker(): Promise<void>;
    ratePlayer(teamName: string, playerId: bigint, rating: bigint): Promise<boolean>;
    refreshNewsTicker(): Promise<Array<string>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startTickerTimer(): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateNews(teamName: string, news: string): Promise<boolean>;
    uploadPlayerImage(teamName: string, playerName: string, image: ExternalBlob): Promise<boolean>;
    uploadTeamLogo(teamName: string, logo: ExternalBlob): Promise<boolean>;
}