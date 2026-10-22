"use client";

// @ts-ignore -- socket.io-client is provided by the app's runtime dependencies.
import { io } from "socket.io-client";

export const socket = io();