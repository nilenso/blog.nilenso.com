{
  description = "nilenso blog development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Ruby 3.3
            ruby_3_3
            bundler

            # Node.js 18+ for OG image generation
            nodejs_20

            # Build dependencies for native gems
            libyaml
            zlib
            openssl
          ];

          shellHook = ''
            echo "nilenso blog development environment"
            echo "Ruby: $(ruby --version)"
            echo "Node: $(node --version)"
            echo ""
            echo "Run 'bundle install' and 'npm install' to install dependencies"
          '';

          # Set up gem installation to a local directory
          GEM_HOME = ".gems";
          GEM_PATH = ".gems";
        };
      });
}
