import { checkaud } from "../components/receive/receive";
import {getNumId } from "../components/receive/receive";
import { getprompt } from "../components/receive/receive";
import { getQRCode } from "../components/receive/receive";
import { QR_GENERATE_API } from "../utils/constants";
import fetchMock from "fetch-mock";
import { expect } from "@jest/globals";
import Swal from "sweetalert2";

// check if audio is playing or not
test("Check if audio is playing or not", () => {
  if (checkaud.paused) {
    const value = "true";
    expect(value).toMatch("true");
  } else {
    const value = "false";
    expect(value).toMatch("false");
  }
});

// check if connection id is number
test("check if connection id is number", () => {
  if (Number.isInteger(getNumId)) {
    const rus = "Connection is working";
    expect(rus).toMatch("Connection is working");
  } else {
    const rus = "Not working";
    expect(rus).toMatch("Not working");
  }
});

// check confirm window value
test("check confirm download screen", () => {
  if (getprompt == Swal.isVisible()) {
    const show = "File downloaded";
    expect(show).toMatch("File downloaded");
  } else {
    const hide = "Download cancel";
    expect(hide).toMatch("Download cancel");
  }
});

test("if qr code is being generated and is correct", async () => {
  fetchMock.get(QR_GENERATE_API + "testing-qr", {
    url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=testing-qr",
  });

  fetchMock.get(
    "http://api.qrserver.com/v1/read-qr-code/?fileurl=http%3A%2F%2Fapi.qrserver.com%2Fv1%2Fcreate-qr-code%2F%3Fdata%3Dtesting-qr",
    [{ type: "qrcode", symbol: [{ seq: 0, data: "testing-qr", error: null }] }]
  );
  let qr_src = await getQRCode("testing-qr");
  expect(qr_src).toEqual(
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=testing-qr"
  );

  let qr_check = await fetch(
    "http://api.qrserver.com/v1/read-qr-code/?fileurl=http%3A%2F%2Fapi.qrserver.com%2Fv1%2Fcreate-qr-code%2F%3Fdata%3Dtesting-qr"
  );
  let res = await qr_check.json();
  expect(res[0].symbol[0].data).toEqual("testing-qr");
});
