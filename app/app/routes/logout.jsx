import { authenticator } from "../utils/auth.server";

export let action = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/" });
};
