# Sway Playground

[![docs](https://docs.rs/forc/badge.svg)](https://docs.rs/forc/)
[![discord](https://img.shields.io/badge/chat%20on-discord-orange?&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/xfpK4Pe)

Sway Playground enables developers to build simple sway contracts in the browser with no installation of tools. This tool is inspired by the Ethereum remix tool or the Rust Playground.

## How it Works

Sway Playground has a simple multi-threaded Hyper backend server which creates a temp project per compile request, builds the project, removes the temp files and returns the output.

The frontend is a simple static frontend using the Ace editor and ASCI_UP console logging.

## Sway Documentation

For user documentation, including installing release builds, see the Sway Book: <https://fuellabs.github.io/sway/latest/>.

## Building from Source

This section is for developing the Sway Playground. For developing contracts and using Sway, see the above documentation section.

### Dependencies

Sway Playground is built in Rust and Javascript. To begin, install the Rust toolchain following instructions at <https://www.rust-lang.org/tools/install>. Then configure your Rust toolchain to use Rust `stable`:

```sh
rustup default stable
```

If not already done, add the Cargo bin directory to your `PATH` by adding the following line to `~/.profile` and restarting the shell session.

```sh
export PATH="${HOME}/.cargo/bin:${PATH}"
```

### Building Sway Playground

Creating a local SSL Certificate:
1. Install the [MkCert tool](https://github.com/FiloSottile/mkcert#installation)
2. Run the installation command: 
```sh
mkcert -install
```
3. Create the SSL certificates:
```sh
cd certs
mkcert example.com "*.example.com" example.test localhost 127.0.0.1 ::1
```

Clone the repository and build the Sway toolchain:

```sh
git clone git@github.com:FuelLabs/sway-playground.git
cd sway-playground
cargo build
```

Confirm the Sway Playground built successfully:

```sh
cargo run --bin sway-playground
```

### Running the Sway Compiler Server

The server is a simple Hyper server for now.

```sh
cargo run
```

### Running the Frontend

The frontend is just a simple static frontend and can be hosted anywhere.

```sh
npm install http-server --global
cd frontend
http-server -S -C ../certs/example.com+5.pem -K ../certs/example.com+5-key.pem --cors
```

Then open http://localhost:9000 on your browser.

## Contributing to Sway

We welcome contributions to Sway Playground, for general contributing guidelines please consult the Sway Contributing Documentation for now.

Please see the [Contributing To Sway](https://fuellabs.github.io/sway/master/reference/contributing_to_sway.html) section of the Sway book for guidelines and instructions to help you get started.

## Todo

- Server side SSL support.
- Ace Editor support for Sway.
- Consider using a server which builds on Hyper (which may be too low level).
- React based UI for easier maintenance and feature expansion.
- Ensuring IO non-blocking (not sure if the server is truly non-blocking and multi-threaded), might need tokio IO.
- Better CI to always make available the latest stable version of Sway.
- Hosting the frontend at a domain (can be done once SSL support is done). 
