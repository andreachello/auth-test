// import { prisma } from "@wysdom/database"
import { generateNonce } from "siwe"

export const getNonce = async (done: any) => {
    try {
        const nonce = generateNonce();
        console.log("nonce", nonce);

        done(null, nonce);
    } catch (error) {
        done(error, null);
    }
};

export const authenticateUser = async (
    address: string,
    done: any
) => {
    try {
        // Check if user exists
        // let user = await prisma.user.findUnique({
        //     where: {
        //         address
        //     }
        // });
        // Create new user if doesn't exist
        // if (!user) {
        //     console.log("no user");
        //     user = await createUser(address)
        // }
        done(null, {
            // Pass user id instead of address
            // id: fields.address
            // id: user.id
        });

    } catch (error) {
        done(error, null);
    }
};