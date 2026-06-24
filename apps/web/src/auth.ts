// export {};
import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  AUTH_SECRET
} from "$env/static/private";

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET
    })
  ],
  secret: AUTH_SECRET,

  callbacks: {
    async redirect() {
      return "/dashboard";
    }
  }
});
console.log("VERCEL AUTH CHECK");
console.log("ID:", !!GOOGLE_CLIENT_ID);
console.log("SECRET:", !!GOOGLE_CLIENT_SECRET);
console.log("AUTH_SECRET:", !!AUTH_SECRET);