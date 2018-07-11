import nodemailer from "nodemailer";
import { apiSuccess } from "../utils";
import mustache from "mustache";
import fs from "fs";
import path from "path";
import { EmailAccountService } from "./";
import { RequestError } from "../utils/ValidationErrors";

export default class Emailer {
  /**
     * 
     * @param {*} emailAccountDetails Format {
      host: "the.smtp.host",
      port: 587,
      secure: false | true,
      auth: {
        user: account.user,
        pass: account.pass
      }
    })
     */
  constructor(emailAccountDetails) {
    this._emailAccountDetails = emailAccountDetails;
    this._transporter = null;
    this.emailTemplateDirectory = "../email-templates";
  }

  setEmailAccountDetails(emailAccountDetails) {
    this._emailAccountDetails = emailAccountDetails;
  }

  async getTransporter() {
    if (!this._transporter) {
      if (!this._emailAccountDetails) {
        this._emailAccountDetails = await new EmailAccountService().getDefaultAccount();
        if (!this._emailAccountDetails)
          throw new Error("You need to at least setup a default account");
      }
      const transportOptions = {
        service: this._emailAccountDetails.name,
        host: this._emailAccountDetails.smtpHost,
        port: this._emailAccountDetails.smtpPort,
        secure: this._emailAccountDetails.secureSsl,
        auth: {
          user: this._emailAccountDetails.smtpUsername,
          pass: this._emailAccountDetails.smtpPassword
        }
      };

      this._transporter = nodemailer.createTransport(transportOptions);
    }
    return this._transporter;
  }

  /**
   *
   * @param {*} emailOptions { subject: "", to: "",}
   * @param {*} htmlTemplatePath path of the file relative to ../email-templates
   * @param {*} viewData
   */
  async sendEmail(emailOptions, htmlTemplatePath, viewData) {
    try {
      if (!emailOptions) throw new RequestError("emailOptions required");
      if (!emailOptions.to) throw new RequestError("emailOptions.to required");
      htmlTemplatePath = path.resolve(__dirname, this.emailTemplateDirectory, htmlTemplatePath);
      const template = fs.readFileSync(htmlTemplatePath, "utf8");

      const htmlBody = mustache.to_html(template, viewData);
      console.log(htmlBody);
      const result = await this.sendEmailToClient(emailOptions, htmlBody);
      return apiSuccess(result);
    } catch (e) {
      console.log("Error sending email..");
      console.log(e);
    }
  }

  /**
   *
   * @param {*} emailOptions an Email object (or similar JSON) with all properties set. Seee https://nodemailer.com/message/ for options
   *
   * @see Email class definition
   */
  async sendEmailToClient(emailOptions, htmlBody) {
    // create reusable transporter object using the default SMTP transport
    // See http://nodemailer.com/message/ and http://nodemailer.com/message/addresses/
    // for mail options.
    const transporter = await this.getTransporter();
    const mailOptions = {
      from: `${process.env.APP_NAME} <${emailOptions.from || this._emailAccountDetails.email}>`,
      to: emailOptions.to,
      subject: emailOptions.subject || `Email addressed to ${emailOptions.to}`,
      html: htmlBody
    };

    // send mail with defined transport object
    return await transporter.sendMail(mailOptions);
  }
}
