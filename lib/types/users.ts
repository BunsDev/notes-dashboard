
export type DBUserUpdateInput = {
	name?: string;
	displayName?: string;
    primaryEmail?: string;
    email?: string;
	image?: string;
    role?: string;
    preferences?: Record<string, any>;
};
