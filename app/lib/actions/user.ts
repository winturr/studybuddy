"use server";

import prisma from "@/app/lib/prisma";
import { User } from "@prisma/client";
import { hash } from "bcrypt";

type ActionError = {
  field: string;
  message: string;
};

type ActionResponse<T = unknown> = {
  success: boolean;
  payload: T | null;
  message: string | null;
  errors: ActionError[];
  input?: any;
};

export async function createUser(
  prevState: ActionResponse<any>,
  formData: FormData
): Promise<ActionResponse<any>> {
  // Extract data
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate data
  const errors: ActionError[] = [];

  if (!name) errors.push({ field: "name", message: "Name is required" });
  if (!email) errors.push({ field: "email", message: "Email is required" });
  if (!password)
    errors.push({ field: "password", message: "Password is required" }) ?? "";

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email as string))
    errors.push({ field: "email", message: "Invalid email format" });

  if (errors.length > 0) {
    return {
      success: false,
      payload: null,
      message: null,
      errors,
      input: { name, email, password },
    };
  }

  // Proceed
  try {
    // If use already exist fail
    const userExist = await prisma.user.findUnique({
      where: { email: email as string },
    });

    if (userExist) {
      return {
        success: false,
        payload: null,
        message: "User already exist",
        errors: [],
        input: { name, email, password },
      };
    }

    // Proceed create user
    const hashedPass = await hash(password as string, 12);
    const user = await prisma.user.create({
      data: {
        name: name as string,
        email: email as string,
        password: hashedPass,
      },
    });

    return {
      success: true,
      payload: user,
      message: null,
      errors: [],
      input: { name, email, password },
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      payload: null,
      message: "Something went wrong",
      errors: [],
    };
  }
}
