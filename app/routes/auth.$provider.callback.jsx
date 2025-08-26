import { authenticator } from "../utils/auth.server";

export let loader = ({ request, params }) => {
  return authenticator.authenticate(params.provider, request, {
    successRedirect: "/",
    failureRedirect: "/signin",
  });
};
