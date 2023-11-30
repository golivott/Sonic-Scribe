exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
    if (stage === "build-html") {
        actions.setWebpackConfig({
            module: {
                rules: [
                    {
                        test: /@magenta/,
                        use: loaders.null(),
                    },
                ],
            },
        });
    }
};
