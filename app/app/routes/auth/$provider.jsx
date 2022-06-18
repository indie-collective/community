import { redirect } from "@remix-run/serve";

import { authenticator } from "../../utils/auth.server";

export let loader = () => redirect("/signin");

export let action = ({ request, params }) => {
  return authenticator.authenticate(params.provider, request);
};
