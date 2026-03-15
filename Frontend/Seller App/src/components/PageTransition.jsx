import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
            transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                filter: { duration: 0.4 }
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
