#!/usr/bin/env node

import crypto from "node:crypto";

const password = process.argv[2] || "champaisthebest";
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");

console.log(`scrypt:${salt}:${hash}`);
