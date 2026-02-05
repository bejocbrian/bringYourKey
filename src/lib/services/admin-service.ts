// Admin service for future backend integration
export const AdminService = {
  async getStats() {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          users: 1248,
          generations: 45672,
          activeKeys: 892,
        });
      }, 500);
    });
  },

  async toggleFeature(featureId: string, enabled: boolean) {
    console.log(`Feature ${featureId} toggled to ${enabled}`);
    return true;
  }
};
