const asyncPromise = new Promise((resolve, reject) => {
  const state = false;

  if (state === true) {
    resolve("Promise Resolved");
  } else {
    reject("Promise Rejected");
  }
});

const asyncHandler = (func) => {
  return () => {
    new Promise((resolve, reject) => {
      resolve(func);
      reject("func Reject");
    });
  };
};

const functionHandler = asyncHandler(async () => {
  try {
    const result = await asyncPromise;
    return result;
  } catch (error) {
    return "Await error";
  }
});

console.log(functionHandler);

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
