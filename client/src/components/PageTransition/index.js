import { motion } from "framer-motion";
import Logo from "../../assets/logo.png";
import { useState } from "react";

const PageTransition = ({ children }) => {
  const [transitionVisible, setTransitionVisible] = useState(true);

  const handleTransitionAnimationComplete = () => {
    setTransitionVisible(false);
  };

  return (
    <>
      {transitionVisible && (
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: 1,
          }}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: {
              duration: 1,
            },
          }}
          exit={{
            opacity: 0,
          }}
          onAnimationComplete={handleTransitionAnimationComplete}
        >
          <motion.img
            src={Logo}
            style={{
              width: "100px",
              opacity: 0,
            }}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              transition: {
                delay: 0.5,
              },
            }}
            exit={{
              opacity: 0,
            }}
          />
        </motion.div>
      )}
      {!transitionVisible && (
        <motion.div
          style={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: {
              duration: 1,
            },
          }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
};

export default PageTransition;
