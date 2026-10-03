import { redirect } from "react-router";

import { authenticator } from "../../utils/auth.server";
import { prevCookie } from "../../utils/prevCookie.server";
import { safeRedirectPath } from "../../utils/safeRedirect";

export let loader = () => redirect("/signin");

// Remembers where to return (the sign-in form's `prev`) for the callback, then
// hands over to the provider, which throws its redirect to the provider.
export let action = async ({ request, params }) => {
  const form = await request.clone().formData();
  const prev = safeRedirectPath(form.get("prev"));

  try {
    return await authenticator.authenticate(params.provider, request);
  } catch (response) {
    if (response instanceof Response) {
      response.headers.append("Set-Cookie", await prevCookie.serialize(prev));
    }
    throw response;
  }
};
