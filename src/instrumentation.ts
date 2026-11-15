export async function register() {
  if(process.env.NEXT_RUNTIME==='nodejs'&&process.env.NODE_ENV==='production'&&process.env.DEPLOYMENT_MODE==='production') {
    const {startApprovalMailScheduler}=await import('./lib/approval-mail-scheduler');
    startApprovalMailScheduler();
  }
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "production" &&
    process.env.SUBSCRIPTION_SCHEDULER_ENABLED === "true"
  ) {
    const { startSubscriptionScheduler } = await import(
      "./lib/subscription-scheduler"
    );
    startSubscriptionScheduler();
  }
}
