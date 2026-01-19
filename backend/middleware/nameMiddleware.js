const splitName = (req, res, next) => {
  if (req.body.name) {
    const fullName = req.body.name.trim();
    const nameParts = fullName.split(" ");

    // 1. Extract First Name (First word)
    const firstName = nameParts[0];

    // 2. Extract Surname (Join the rest)
    // If no surname is typed, we use "." because Zoho REJECTS leads without a Last Name.
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

    // 3. Override request body
    req.body.name = firstName;
    req.body.surname = lastName;

    console.log(`✂️ Middleware Split: First=[${firstName}] Last=[${lastName}]`);
  }
  next();
};

export { splitName };
