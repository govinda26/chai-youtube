// const asyncPromise = new Promise((resolve, reject) => {
//   const state = false;

//   if (state === true) {
//     resolve("Promise Resolved");
//   } else {
//     reject("Promise Rejected");
//   }
// });

// const asyncHandler = (func) => {
//   return () => {
//     return new Promise((resolve) => {
//       resolve(func()).catch((error) => {
//         throw error;
//       });
//     });
//   };
// };

// const functionHandler = asyncHandler(async () => {
//   //only the function is passed as the parameter
//   const result = await asyncPromise;
//   return result;
// });

// functionHandler().catch((error) => console.log("Async error", error));

// const ErrorPromise = new Promise((resolve, reject) => {
//   const status = false;
//   if (status === true) {
//     resolve("Promise is Resolved");
//   } else {
//     throw error;
//   }
// });

// ErrorPromise.catch((error) => console.log("Thrown Error: ", error));

// functionResult.catch((error) => console.log("Async handler rejects:", error));

// const asyncFunction = async () => {
//   try {
//     const result = await asyncPromise;
//     return result;
//   } catch (error) {
//     console.log("Await error", error);
//   }
// };

// const asyncResult = asyncFunction();
// asyncResult.then((response) => console.log("Async Result:", response));
// asyncResult.catch((error) => console.log(error));

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const error = new ApiError("404");

const Strings = ["Abc", "Def", "Ghi", ""];

Strings.some((str) => console.log(str === ""));
