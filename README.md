# TCP vs UDP

## Introduction

The purpose of this work is to present a comparative analysis of the TCP and UDP methods in file transfer, highlighting information on performance, reliability, and complexity.

## First Protocol: TCP

In the development of the file transfer algorithm using the TCP protocol, we observed that the code complexity was low. In a few lines, it was possible to establish a connection and perform the necessary actions to receive and compress a file.

We used the native NodeJS library to measure performance, the [perf_hooks](https://nodejs.org/api/perf_hooks.html) library. With it, we were able to measure performance from point A to point B. Thus, we noted that to establish a connection, read the client file, compress it, and return it to the client, TCP performs in **27.31 seconds**.

## Second Protocol: UDP

With UDP, we noticed that it is a "lighter" protocol, but the implementation had some problems that we had to solve because, unlike TCP, it does not maintain an active connection. Therefore, we decided to send the file to be compressed through _chunks_, which are small packets of information.

We did not use the previously mentioned TCP library to measure performance due to implementation issues. However, its use can be disregarded because of the extreme speed difference observed in the tests.

The UDP protocol sent the file through _chunks_ to the UDP server, the server read it, compressed it, and returned the file to the client in **0.67 seconds**.

## Discussion

In this section, we analyze the advantages and disadvantages of the TCP and UDP protocols based on our experiments and discuss situations where each protocol is more suitable.

### Advantages of TCP

- **Reliability**: TCP ensures the delivery of packets in the correct order and without losses, retransmitting packets if necessary.
- **Flow and Congestion Control**: Adjusts the data sending rate to avoid network overload.
- **Data Integrity**: Uses checksums to ensure data is not corrupted during transmission.
- **Connection-Oriented**: Establishes a stable connection between client and server before starting data transfer, ensuring both parties are ready for communication.

### Disadvantages of TCP

- **Performance**: The establishment and maintenance of the connection increase latency and overhead, making TCP slower.
- **Complexity**: TCP implementation can be more complex due to its state control and retransmission mechanisms.
- **Resources**: Consumes more network and system resources due to connection management overhead.

### Advantages of UDP

- **Low Latency**: Without the need to establish a connection, UDP can transmit data almost immediately, resulting in low latency.
- **Simplicity**: UDP implementation is simpler and more straightforward, without the need for complex connection control mechanisms.
- **Performance**: The smaller header overhead and absence of retransmission controls make UDP a faster protocol.
- **Efficiency in Simple Applications**: Ideal for applications that can tolerate the loss of some packets, such as video streaming or online games.

### Disadvantages of UDP

- **Reliability**: UDP does not guarantee packet delivery or order and does not provide retransmission mechanisms.
- **No Flow and Congestion Control**: Can result in network congestion and packet loss under high load conditions.
- **Data Integrity**: Does not have native mechanisms to ensure data integrity beyond a simple header integrity check.

### When to Use TCP

TCP is more suitable for applications where data reliability and integrity are critical. Examples include:

- **File Transfer**: FTP, SFTP, and other file transfer applications where data loss is unacceptable.
- **Emails**: SMTP protocol for sending and IMAP/POP3 for receiving emails.
- **Web Browsing**: HTTP/HTTPS, where order and completeness of data are essential for proper page rendering.
- **Databases**: Database connections, where data consistency and integrity are fundamental.

### When to Use UDP

UDP is more suitable for applications where speed is crucial, and some packet loss can be tolerated. Examples include:

- **Video and Audio Streaming**: Applications like VoIP (Voice over IP) and live streaming services where latency is more important than data perfection.
- **Online Games**: Games that require quick responses and can tolerate some data loss without significantly impacting the user experience.
- **Broadcast Services**: Protocols like DNS (Domain Name System) and SNMP (Simple Network Management Protocol) that benefit from UDP's speed.

In conclusion, the choice between TCP and UDP should be based on the specific requirements of the application. TCP offers reliability and integrity, making it ideal for data-critical applications. UDP, on the other hand, offers low latency and simplicity, making it ideal for applications where speed is more important than data perfection.
