import { AssetProfile } from '../types';
import { FrancisHorizontalPlugin } from '../lib/plugins/FrancisHorizontalPlugin';

class ProfileLoaderService {
    private profiles: Record<string, AssetProfile> = {
        'Francis': FrancisHorizontalPlugin,
    };

    getProfile(type: string): AssetProfile | undefined {
        return this.profiles[type];
    }

    getAllProfiles(): AssetProfile[] {
        return Object.values(this.profiles);
    }

    // Helper to get specialized math for an asset
    getMath(type: string) {
        const profile = this.getProfile(type);
        return profile?.math;
    }

    // Helper to get specialized patterns for Sentinel
    getPatterns(type: string) {
        const profile = this.getProfile(type);
        return profile?.diagnostics.patterns || [];
    }
}

export const ProfileLoader = new ProfileLoaderService();
