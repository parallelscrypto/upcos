import React, { useState, useEffect } from "react";
import lf from "localforage";
import { isNil, map } from "ramda";
import SDK from "weavedb-sdk";
import { Buffer } from "buffer";
import { ethers } from "ethers";

const Popit = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pops, setPops] = useState([]);
  const [tab, setTab] = useState("All");
  const [initDB, setInitDB] = useState(true);

  let db;

  const setupWeaveDB = async () => {
    window.Buffer = Buffer;
    db = new SDK({
      contractTxId: "h-3JjZ2V6VWeyfA7Iya2YDhh-nqKSaTY1GYa7Gar_Oc", // Update with your contractTxId
    });
    await db.initializeWithoutWallet();
    setInitDB(true);
  };

  const getPops = async () => {
    setPops(await db.cget("pops", ["name", "desc"]));
  };

  const getMyPops = async () => {
    setPops(
      await db.cget(
        "pops",
        ["user_address", "==", user.wallet.toLowerCase()],
      )
    );
  };

  const addPop = async (pop, payload, prefix) => {
    await db.add(
      {
        pop,
        name: pop,
        user_address: db.signer(),
        proof: "proof",
        payload,
        prefix,
      },
      "pops",
      user
    );
    await getPops();
  };

  const completePop = async (id) => {
    await db.update(
      {
        done: true,
      },
      "pops",
      id,
      user
    );
    await getPops();
  };

  // More functions...

  useEffect(() => {
    setupWeaveDB();
  }, []);

  useEffect(() => {
    if (initDB) {
      if (tab === "All") {
        getPops();
      } else {
        getMyPops();
      }
    }
  }, [tab, initDB]);

  // Other JSX components and rendering logic...

  return (
    <div>
      <p>hello</p>
    </div>
  );
};

export default Popit;

